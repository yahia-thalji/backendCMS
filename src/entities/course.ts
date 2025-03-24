import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Enrollments } from './enrollments';
import { Resources } from './resources';
import { Assignment } from './assignment';
import { Reviews } from './reviews';

@Entity({ name: "Course" })
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn()
  courseId: number;

  @Column({ type: 'varchar' })
  courseTitle: string;
  
  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'date' })
  startDate: string; // You can use 'string' or 'Date' depending on your preferred type for dates

  @Column({ type: 'varchar' })
  duration: string;
  
  @Column({ type: 'varchar' })
  instructor: string;

  @Column({ type: 'decimal' })
  price: number;
  
  @Column({ type: 'decimal' })
  newPrice: number;

  @Column({ type: 'enum', enum: ['open', 'close'], default: 'close' })
  status: 'open' | 'close';

  @Column({ type: 'varchar' })
  meetingLink:string;

  @OneToMany(() => Enrollments, enrollments => enrollments.course)
  enrollments: Enrollments[];

  @OneToMany(() => Assignment, (assignment) => assignment.course)
  assignment: Assignment[];

  @OneToMany(() => Resources, (resources) => resources.course)
  resources: Resources[];

    @ManyToMany(() => Reviews, (reviews) => reviews.course, { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinTable({
      name: 'CourseReviews',
      joinColumn: {
        name: 'courseId',
        referencedColumnName: 'courseId'
      },
      inverseJoinColumn: {
        name: 'reviewID',
        referencedColumnName: 'reviewID'
      }
    })
    review: Reviews[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
