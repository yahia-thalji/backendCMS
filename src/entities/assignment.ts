import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Assignmentsubmition } from './assignmentSubmition';
import { Course } from './course';

@Entity({ name: "Assignment" })
export class Assignment extends BaseEntity {
  @PrimaryGeneratedColumn()
  assignmentId: number;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar" })
  subject: string;

  @Column({ type: "enum", enum: ['pass', 'fill'] })
  status: 'pass' | 'fill';

  @OneToMany(() => Assignmentsubmition, assignmentsubmition => assignmentsubmition.assignment)
  assignmentsubmition: Assignmentsubmition[];

  @ManyToOne(() => Course, (course) => course.assignment)
  course: Course;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
