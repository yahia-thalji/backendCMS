import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Assignment } from './assignment';

@Entity({ name: "Assignmentsubmition" })
export class Assignmentsubmition extends BaseEntity {
  @PrimaryGeneratedColumn()
  assignmentSubmitionId: number;

  @Column({ type: 'varchar' })
  answer: string;

  @ManyToOne(()=>User , (user)=>user.assignmentsubmition)
  user:User
  
  @Column({ type: "enum", enum: ['pass', 'fill'] })
  status: 'pass' | 'fill';

  @ManyToOne(() => Assignment, assignment => assignment.assignmentsubmition)
  assignment: Assignment;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
