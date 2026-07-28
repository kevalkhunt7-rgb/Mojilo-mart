import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a contact name'],
    trim: true,
  },
  street: {
    type: String,
    required: [true, 'Please add street details'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'Please add a state'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Please add a country'],
    default: 'India',
    trim: true,
  },
  zipCode: {
    type: String,
    required: [true, 'Please add a ZIP/Postal code'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add a contact phone number'],
    trim: true,
  },
  isDefaultShipping: {
    type: Boolean,
    default: false,
  },
  isDefaultBilling: {
    type: Boolean,
    default: false,
  },
  addressType: {
    type: String,
    enum: ['shipping', 'billing', 'both'],
    default: 'shipping',
  }
}, {
  timestamps: true,
});

addressSchema.index({ user: 1 });

const Address = mongoose.model('Address', addressSchema);

export default Address;
