// src/migration/1710000000000-InitialSchema.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1710000000000 implements MigrationInterface {
    name = 'InitialSchema1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // تفعيل امتداد uuid-ossp أولاً
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // إنشاء جدول العملات (currencies)
        await queryRunner.query(`
            CREATE TABLE "currencies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "code" character varying NOT NULL,
                "symbol" character varying NOT NULL,
                "exchangeRate" numeric NOT NULL DEFAULT '1',
                "isBase" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_5b58560a2c3b5f21b4c672e52c7" UNIQUE ("code"),
                CONSTRAINT "PK_2ec797f2cd6941e6d4d6d17b7f4" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول الموردين (suppliers)
        await queryRunner.query(`
            CREATE TABLE "suppliers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "number" character varying NOT NULL,
                "name" character varying NOT NULL,
                "contactPerson" character varying,
                "email" character varying,
                "phone" character varying,
                "address" character varying,
                "country" character varying,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97d41e4eec38b887408bacc6e11" UNIQUE ("number"),
                CONSTRAINT "PK_b70ac51766a6e7a4d5c6d45d37f" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول المواقع (locations)
        await queryRunner.query(`
            CREATE TABLE "locations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "number" character varying NOT NULL,
                "name" character varying NOT NULL,
                "type" character varying NOT NULL,
                "address" character varying,
                "capacity" integer NOT NULL DEFAULT '0',
                "currentUsage" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_17e95947b892251ce7b4b5d86c5" UNIQUE ("number"),
                CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول العناصر (items)
        await queryRunner.query(`
            CREATE TABLE "items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "number" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "quantity" integer NOT NULL DEFAULT '0',
                "unit" character varying NOT NULL,
                "price" numeric NOT NULL DEFAULT '0',
                "category" character varying,
                "profitMargin" numeric,
                "profitAmount" numeric,
                "costPrice" numeric,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "currencyId" uuid,
                "locationId" uuid,
                "supplierId" uuid,
                CONSTRAINT "UQ_2c58e8b9e27e1eaa1e6d71d3f7e" UNIQUE ("number"),
                CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول الفواتير (invoices)
        await queryRunner.query(`
            CREATE TABLE "invoices" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "number" character varying NOT NULL,
                "issueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "totalAmount" numeric NOT NULL DEFAULT '0',
                "status" character varying NOT NULL DEFAULT 'draft',
                "notes" character varying,
                "items" jsonb NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "supplierId" uuid,
                "currencyId" uuid,
                CONSTRAINT "UQ_0e98ce3edb65ae5d6d3f42d7c1e" UNIQUE ("number"),
                CONSTRAINT "PK_6682f1e6eecb6668c0c8dcee632" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول الشحنات (shipments)
        await queryRunner.query(`
            CREATE TABLE "shipments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "containerNumber" character varying NOT NULL,
                "billOfLading" character varying NOT NULL,
                "departureDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "arrivalDate" TIMESTAMP WITH TIME ZONE,
                "status" character varying NOT NULL DEFAULT 'pending',
                "items" jsonb,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "supplierId" uuid,
                "currencyId" uuid,
                CONSTRAINT "UQ_4c8d13b3e6d5a5e5e5e5e5e5e5e5" UNIQUE ("containerNumber"),
                CONSTRAINT "PK_3aacf3810d7c6c7c7c7c7c7c7c7c" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول التحويلات الداخلية (internal_transfers)
        await queryRunner.query(`
            CREATE TABLE "internal_transfers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "transferNumber" character varying NOT NULL,
                "transferDate" date NOT NULL DEFAULT CURRENT_DATE,
                "status" character varying NOT NULL DEFAULT 'pending',
                "items" jsonb NOT NULL DEFAULT '[]',
                "notes" character varying,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "fromLocationId" uuid,
                "toLocationId" uuid,
                CONSTRAINT "UQ_9a6e6e6e6e6e6e6e6e6e6e6e6e6e" UNIQUE ("transferNumber"),
                CONSTRAINT "PK_7a6e6e6e6e6e6e6e6e6e6e6e6e6e" PRIMARY KEY ("id")
            )
        `);

        // إضافة العلاقات الخارجية (نفس الكود السابق)...
        // [نفس كود العلاقات الخارجية من الأعلى]
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // حذف جميع العلاقات الخارجية أولاً
        await queryRunner.query(`ALTER TABLE "internal_transfers" DROP CONSTRAINT "FK_be6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "internal_transfers" DROP CONSTRAINT "FK_ae6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_9e6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_8e6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_7e6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_6d6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_5c6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_4b6e6e6e6e6e6e6e6e6e6e6e6e6e"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_3a6e6e6e6e6e6e6e6e6e6e6e6e6e"`);

        // حذف الجداول
        await queryRunner.query(`DROP TABLE "internal_transfers"`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TABLE "locations"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
        await queryRunner.query(`DROP TABLE "currencies"`);

        // إزالة الامتداد (اختياري)
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}