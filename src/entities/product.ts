import { AfterLoad, BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category';
import { Cart } from './cart';
import { Resources } from './resources';
import { Reviews } from './reviews';
import { CartItem } from './cartItem';
import { Brand } from './brand';

@Entity({ name: "Product" })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  description: string;


  @Column({ type: "varchar", nullable: true })
  howToUse: string;

  @Column('int')
  quantity: number;

  @Column({ type: "decimal", nullable: false })
  price: number;

  @Column({ type: "decimal", nullable: true })
  newPrice?: number; // Optional field

  @Column('enum', { enum: ['out of stock', 'in stock', 'running low'], default: 'in stock' })
  status: 'out of stock' | 'in stock' | 'running low';

  @ManyToOne(() => Category, (category) => category.product)
  category: Category;

  @ManyToOne(() => Cart, (cart) => cart.product )
  cart: Cart;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product, { eager: true ,  onDelete: 'CASCADE'})
  cartItems: CartItem[];

  @OneToMany(() => Resources, (resources) => resources.product, { eager: true, cascade: true, onDelete: 'CASCADE' })
  resources: Resources[];
  

  @ManyToMany(() => Reviews, (review) => review.product, { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinTable({
    name: 'ProductsReviews',
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'productId'
    },
    inverseJoinColumn: {
      name: 'reviewID',
      referencedColumnName: 'reviewID'
    }
  })
  review: Reviews[];

  @ManyToOne(()=>Brand , (brand)=>brand.product)
  brand:Brand

  @Column('int', { default: 0 })
  AvgRating: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;


  @BeforeInsert()
  @BeforeUpdate()
  checkStatus = () => {
    if (this.quantity == 0) {
      this.status = 'out of stock';
    } else if (this.quantity < 10) {
      this.status = 'running low';
    } else {
      this.status = 'in stock';
    }
  }

  @AfterLoad()
  calculateAvgRating() {
    if (!Array.isArray(this.review) || this.review.length === 0) {
      this.AvgRating = 0;
    } else {
      const totalRating = this.review.reduce((acc, review) => acc + (review.rating ?? 0), 0);
      this.AvgRating = totalRating / this.review.length;
    }
  }
  


}
