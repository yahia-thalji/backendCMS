import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Product } from './product';

@Entity({ name: "Category" })
@Index("name_index", ["name"])  // Adding index to the 'name' column
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  categoryId: number;

  @Column({type:'varchar' ,unique:true})
  @Index()  // This ensures 'name' is indexed
  name: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.category)
  product: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
