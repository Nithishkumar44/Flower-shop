import { PrismaClient, Role, DeliveryType, DiscountType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Luxe Blooms Database... 🌱');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Floral Manager',
      email: 'admin@luxeblooms.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      cart: { create: {} }
    }
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create normal user
  const userPasswordHash = await bcrypt.hash('UserPass123!', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Eleanor Vance',
      email: 'user@luxeblooms.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      cart: { create: {} }
    }
  });
  console.log(`Standard user created: ${user.email}`);

  // Create user address
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      title: 'Home Address',
      street: '12, Serenade Lane, Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '+91 9876543210',
      isDefault: true
    }
  });
  console.log(`User address seeded`);

  // Create Categories
  const categories = [
    {
      name: 'Premium Roses',
      slug: 'roses',
      description: 'Hand-picked velvety roses expressing passionate affection and luxury.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Elegant Lilies',
      slug: 'lilies',
      description: 'Graceful and fragrant lilies reflecting pure intentions and nobility.',
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Vibrant Tulips',
      slug: 'tulips',
      description: 'Colorful Dutch tulips radiating happiness, warmth, and fresh beginnings.',
      image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Exotic Orchids',
      slug: 'orchids',
      description: 'Rare structural orchids representing luxury, rare strength, and beauty.',
      image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Luxe Bouquets',
      slug: 'mixed-bouquets',
      description: 'Artfully curated mixed arrangement combining multiple premium floral varieties.',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const categoryMap: { [key: string]: string } = {};

  for (const cat of categories) {
    const createdCat = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = createdCat.id;
  }
  console.log('Categories seeded');

  // Create Products
  const products = [
    {
      name: 'Crimson Royalty Bouquet',
      slug: 'crimson-royalty-bouquet',
      description: 'An elite bundle of 24 deep red Ecuadorian roses wrapped in luxury black craft paper and tied with a gold silk ribbon.',
      price: 2499,
      salePrice: 1999,
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1533604131587-35665891c121?w=800&auto=format&fit=crop&q=80'
      ],
      isBestSeller: true,
      isSameDayDelivery: true,
      flowerType: 'Rose',
      occasion: 'Anniversary',
      deliveryType: DeliveryType.SAME_DAY,
      rating: 4.8,
      categoryId: categoryMap['roses']
    },
    {
      name: 'Blush Velvet Rose Box',
      slug: 'blush-velvet-rose-box',
      description: 'A round premium suede box containing 16 light pink premium roses arranged perfectly. A true statement of luxurious romance.',
      price: 3499,
      salePrice: null,
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&auto=format&fit=crop&q=80'
      ],
      isBestSeller: true,
      isSameDayDelivery: false,
      flowerType: 'Rose',
      occasion: 'Birthday',
      deliveryType: DeliveryType.HAND_DELIVERED,
      rating: 4.9,
      categoryId: categoryMap['roses']
    },
    {
      name: 'Madonna Lilies Vase',
      slug: 'madonna-lilies-vase',
      description: '10 fragrant stems of majestic white oriental lilies arranged in a modern cylindrical heavy glass vase with eucalyptus greens.',
      price: 1899,
      salePrice: 1699,
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508789454646-bef72439f197?w=800&auto=format&fit=crop&q=80'
      ],
      isBestSeller: false,
      isSameDayDelivery: true,
      flowerType: 'Lily',
      occasion: 'Sympathy',
      deliveryType: DeliveryType.SAME_DAY,
      rating: 4.5,
      categoryId: categoryMap['lilies']
    },
    {
      name: 'Sun-drenched Meadow Tulip Bouquet',
      slug: 'sundrenched-tulips',
      description: 'A cheerful burst of 20 yellow and orange spring tulips, freshly harvested, wrapped in bio-degradable eco-kraft wrap.',
      price: 1599,
      salePrice: null,
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&auto=format&fit=crop&q=80'
      ],
      isBestSeller: false,
      isSameDayDelivery: true,
      flowerType: 'Tulip',
      occasion: 'Congratulations',
      deliveryType: DeliveryType.SAME_DAY,
      rating: 4.7,
      categoryId: categoryMap['tulips']
    },
    {
      name: 'Opulent Violet Cymbidium Orchids',
      slug: 'violet-cymbidium-orchids',
      description: 'A striking structural display of 3 tall stems of purple Cymbidium orchids, paired with tropical monstera leaves in a black ceramic pot.',
      price: 4500,
      salePrice: 3999,
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&auto=format&fit=crop&q=80'
      ],
      isBestSeller: true,
      isSameDayDelivery: false,
      flowerType: 'Orchid',
      occasion: 'Business',
      deliveryType: DeliveryType.COURIER,
      rating: 5.0,
      categoryId: categoryMap['orchids']
    },
    {
      name: 'Le Bouquet Parisien',
      slug: 'le-bouquet-parisien',
      description: 'Our signature seasonal masterpiece. Features a gorgeous mix of hydrangeas, roses, lisianthus, and baby breath in a pastel wrapping.',
      price: 2999,
      salePrice: 2799,
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1562244970-71a030d31662?w=800&auto=format&fit=crop&q=80'
      ],
      isBestSeller: true,
      isSameDayDelivery: true,
      flowerType: 'Mixed',
      occasion: 'Love',
      deliveryType: DeliveryType.SAME_DAY,
      rating: 4.9,
      categoryId: categoryMap['mixed-bouquets']
    }
  ];

  for (const prod of products) {
    const createdProd = await prisma.product.create({ data: prod });
    
    // Seed reviews
    await prisma.review.create({
      data: {
        userId: user.id,
        productId: createdProd.id,
        rating: Math.floor(createdProd.rating),
        comment: `Absolutely breathtaking! The flowers were fresh, perfectly arranged, and delivered right on time. Highly recommend the ${createdProd.name}!`
      }
    });
  }
  console.log('Products & Reviews seeded');

  // Seed Coupons
  const coupons = [
    {
      code: 'WELCOME10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 999,
      maxDiscount: 500,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    },
    {
      code: 'LUXE500',
      discountType: DiscountType.FIXED,
      discountValue: 500,
      minOrderValue: 2999,
      maxDiscount: 500,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      isActive: true
    }
  ];

  for (const coup of coupons) {
    await prisma.coupon.create({ data: coup });
  }
  console.log('Coupons seeded');

  console.log('Database seeded successfully! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
