import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Product } from './product'
import { Resources } from './resources'

@Entity({name:"Brand"})
export class Brand extends BaseEntity {

    @PrimaryGeneratedColumn()
    brandId:number

    @Column({type:"varchar", unique:true})
    name: string

    @OneToMany(()=> Product , (product)=>product.brand)
    product:Product[]

    @OneToOne(()=>Resources , (resource)=>resource.brand)
    @JoinColumn()
    resources: Resources

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}