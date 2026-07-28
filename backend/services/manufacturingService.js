import ManufacturingJob from '../models/ManufacturingJob.js';
import PrinterAssignment from '../models/PrinterAssignment.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

class ManufacturingService {
  /**
   * Enqueues an order item into the printing manufacturing workflow
   */
  async queueManufacturingJob(orderId, orderItemId) {
    logger.info(`Queueing manufacturing job for Order: ${orderId}, Item: ${orderItemId}`);

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const orderItem = await OrderItem.findById(orderItemId);
    if (!orderItem) {
      throw new ApiError(404, 'Order item not found');
    }

    // Determine priority based on express shipping or pricing subtotal
    let priority = 'Medium';
    if (order.shippingAddress?.street?.toLowerCase().includes('express') || order.pricingSummary?.grandTotal > 5000) {
      priority = 'High';
    }

    // Check if job already queued
    const existing = await ManufacturingJob.findOne({ orderItemId });
    if (existing) {
      logger.info(`Manufacturing job already exists for item: ${orderItemId}, skipping creation.`);
      return existing;
    }

    const job = await ManufacturingJob.create({
      orderId,
      orderItemId,
      status: 'Waiting',
      priority,
      statusHistory: [{
        status: 'Waiting',
        notes: 'Job enqueued in production queue, waiting for assignment.',
        updatedBy: 'system'
      }]
    });

    return job;
  }

  /**
   * Assigns a job to a printing operator and machine
   */
  async assignJob(jobId, printerId, machine, adminId) {
    const job = await ManufacturingJob.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Manufacturing job not found');
    }

    // State machine check: can only assign if job is currently waiting
    if (job.status !== 'Waiting') {
      throw new ApiError(400, `Cannot assign job currently in '${job.status}' status`);
    }

    // Validate printer assignment capacity limits
    const assignment = await PrinterAssignment.findOne({ printerId, machine, isActive: true });
    if (assignment) {
      if (assignment.currentDailyLoad >= assignment.maxDailyCapacity) {
        logger.warn(`Printer assignment load warnings: printer ${printerId} load (${assignment.currentDailyLoad}) exceeds capacity limit (${assignment.maxDailyCapacity})`);
      }
      assignment.currentDailyLoad += 1;
      await assignment.save();
    }

    job.status = 'Assigned';
    job.assignedPrinter = printerId;
    job.machine = machine;
    job.statusHistory.push({
      status: 'Assigned',
      notes: `Job allocated to operator printer: ${printerId} on machine ${machine}.`,
      updatedBy: adminId ? adminId.toString() : 'system'
    });

    await job.save();
    return job;
  }

  /**
   * Transitions the job to the active printing state
   */
  async startJob(jobId, printerId) {
    const job = await ManufacturingJob.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Manufacturing job not found');
    }

    // State machine guard: Assigned -> Printing
    if (job.status !== 'Assigned') {
      throw new ApiError(400, `Cannot start printing a job in '${job.status}' status`);
    }

    // Enforce operator constraints
    if (printerId && job.assignedPrinter?.toString() !== printerId.toString()) {
      throw new ApiError(403, 'Unauthorized. Job is assigned to another printer operator');
    }

    job.status = 'Printing';
    job.startedAt = Date.now();
    job.statusHistory.push({
      status: 'Printing',
      notes: 'Job printing phase started.',
      updatedBy: printerId ? printerId.toString() : 'system'
    });

    await job.save();
    return job;
  }

  /**
   * Moves print output into the Quality Check (QC) phase
   */
  async qcJob(jobId, printerId) {
    const job = await ManufacturingJob.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Manufacturing job not found');
    }

    // State machine guard: Printing -> QC
    if (job.status !== 'Printing') {
      throw new ApiError(400, `Cannot send a job in '${job.status}' status to QC`);
    }

    job.status = 'QC';
    job.statusHistory.push({
      status: 'QC',
      notes: 'Print completed, sent to Quality Check (QC) inspection.',
      updatedBy: printerId ? printerId.toString() : 'system'
    });

    await job.save();
    return job;
  }

  /**
   * Completes the manufacturing job and flags order updates
   */
  async completeJob(jobId, printerId) {
    const job = await ManufacturingJob.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Manufacturing job not found');
    }

    // State machine guard: QC -> Completed
    if (job.status !== 'QC') {
      throw new ApiError(400, `Cannot mark job as completed from '${job.status}' status`);
    }

    job.status = 'Completed';
    job.completedAt = Date.now();
    job.statusHistory.push({
      status: 'Completed',
      notes: 'QC check passed. Printing job successfully completed.',
      updatedBy: printerId ? printerId.toString() : 'system'
    });

    await job.save();

    // Check if all custom items for this order are completed
    const siblingJobs = await ManufacturingJob.find({ orderId: job.orderId });
    const allCompleted = siblingJobs.every(sj => sj.status === 'Completed');

    if (allCompleted) {
      // Transition order status to 'quality_check' or 'packed'
      const order = await Order.findById(job.orderId);
      if (order && order.orderStatus === 'printing') {
        order.orderStatus = 'quality_check';
        order.statusHistory.push({
          status: 'quality_check',
          notes: 'All manufacturing print jobs completed. Order is now inside quality check pipeline.',
          updatedBy: 'system'
        });
        await order.save();
      }
    }

    return job;
  }
}

export default new ManufacturingService();
