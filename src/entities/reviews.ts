import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany } from 'typeorm';
import { User } from './user';
import { Product } from './product';
import { Course } from './course';

@Entity({ name: "Reviews" })
export class Reviews extends BaseEntity {
  @PrimaryGeneratedColumn()
  reviewID: number;

  @Column('int', { nullable: true })
  rating?: number; // Optional field

  @Column('text', { nullable: true })
  comment?: string; // Optional field

  @ManyToOne(() => User, (user) => user.UserID)
  user: User;
    
  @ManyToMany(() => Product, (product) => product.review)
   product: Product[]; 

  @ManyToMany(() => Course, (course) => course.review)
  course: Course[]; 

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
