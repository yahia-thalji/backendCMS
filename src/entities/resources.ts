import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';
import { Product } from './product';
import { Course } from './course';
import { Brand } from './brand';

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

  @ManyToOne(() => Product, (product) => product.resources , {onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Course, (course) => course.resources ,{ onDelete: 'CASCADE' })
  course: Course;

  @OneToOne(()=>Brand , (brand)=>brand.resources)
  brand: Brand

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
