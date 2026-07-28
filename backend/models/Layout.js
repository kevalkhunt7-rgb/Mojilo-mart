import mongoose from 'mongoose';

const layoutSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hero', 'new-collection', 'canvas-template'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  hero: {
    slides: [{
      image: {
        url: String,
        publicId: String,
      },
      title: String,
      subtitle: String,
      link: String
    }],
  },
  newCollection: {
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    banner: {
      image: {
        url: String,
        publicId: String,
      },
      title: String,
      subtitle: String,
    },
  },
  canvasTemplate: {
    printAreaName: String, // Front, Back, etc.
    textLayers: [{
      text: String,
      fontFamily: String,
      color: String,
      x: Number,
      y: Number,
    }],
    imageLayers: [{
      imageUrl: String,
      x: Number,
      y: Number,
      scaleX: Number,
      scaleY: Number,
    }]
  }
}, {
  timestamps: true,
});

layoutSchema.index({ type: 1 });

const Layout = mongoose.model('Layout', layoutSchema);

export default Layout;