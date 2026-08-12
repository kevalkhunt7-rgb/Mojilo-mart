import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ createdAt: -1 });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

categorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update) {
    if (update.name) {
      update.slug = slugify(update.name);
    } else if (update.$set?.name) {
      update.$set.slug = slugify(update.$set.name);
    }
  }

  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;