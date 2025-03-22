import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// import { User } from '../user/User';
import { Course } from './course';
import { User } from './user';

@Entity({ name: 'Enrollments' })
export class Enrollments extends BaseEntity {

  @PrimaryGeneratedColumn()
  myCourseId: number;

  @Column({ type: "enum", enum: ['accept', 'rejected', 'pending'], default: "pending" })
  status: 'pending' | 'accept' | 'rejected';

  @Column({ type: "date" })
  expireDate: string; // You can use 'string' or 'Date' based on how you handle the date format

  @ManyToOne(()=>User , (user)=>user.enrollments)
  user:User;

  @ManyToOne(() => Course, course => course.enrollments)
  course: Course;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
