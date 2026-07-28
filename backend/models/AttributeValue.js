import mongoose from 'mongoose';

const attributeValueSchema = new mongoose.Schema({
  attribute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attribute',
    required: true,
  },
  value: {
    type: String,
    required: [true, 'Please add an attribute value (e.g. XL, #FF0000)'],
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a display name (e.g. Extra Large, Red)'],
    trim: true,
  }
}, {
  timestamps: true,
});

attributeValueSchema.index({ attribute: 1 });

const AttributeValue = mongoose.model('AttributeValue', attributeValueSchema);

export default AttributeValue;
