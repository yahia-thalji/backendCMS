import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category';
import { Cart } from './cart';
import { Resources } from './resources';
import { Reviews } from './reviews';

@Entity({ name: "Product" })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  description: string;

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

  @OneToMany(() => Cart, (cart) => cart.product )
  cart: Cart[];

  @OneToMany(() => Resources, (resources) => resources.product, { eager: true })
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
}
