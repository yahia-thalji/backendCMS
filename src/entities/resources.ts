import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';
import { Product } from './product';
import { Course } from './course';

@Entity({ name: "Resources" })
export class Resources extends BaseEntity {

  @PrimaryGeneratedColumn()
  resourceID: number;

  @Column()
  entityName: string;

  @Column()
  fileType: string;

  @Column()
  filePath: string;

  @OneToOne(() => User, (user) => user.UserProfilePicture)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Product, (product) => product.resources)
  product: Product;

  @ManyToOne(() => Course, (course) => course.resources)
  course: Course;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
