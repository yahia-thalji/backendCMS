import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1710000000000 implements MigrationInterface {
    name = 'InitialSchema1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables in dependency order
        await queryRunner.query(`
            CREATE TABLE "Role" (
                "roleId" SERIAL PRIMARY KEY,
                "roleName" VARCHAR NOT NULL DEFAULT 'user'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "User" (
                "UserID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "firstName" VARCHAR(25) NOT NULL,
                "lastName" VARCHAR(25) NOT NULL,
                "email" VARCHAR(255) UNIQUE NOT NULL,
                "phoneNumber" VARCHAR(12) UNIQUE NOT NULL,
                "address" VARCHAR(100) NOT NULL,
                "gender" VARCHAR NOT NULL CHECK ("gender" IN ('male', 'female')),
                "dateOfBirth" DATE NOT NULL,
                "password" VARCHAR(255) NOT NULL,
                "resetCode" VARCHAR,
                "resetCodeExpires" TIMESTAMP,
                "resetCodeAttempts" INTEGER NOT NULL DEFAULT 0,
                "loginAttempts" INTEGER NOT NULL DEFAULT 0,
                "accountLockedUntil" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "roleId" INTEGER
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Category" (
                "categoryId" SERIAL PRIMARY KEY,
                "name" VARCHAR UNIQUE NOT NULL,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
        await queryRunner.query(`CREATE INDEX "name_index" ON "Category" ("name")`);

        await queryRunner.query(`
            CREATE TABLE "Brand" (
                "brandId" SERIAL PRIMARY KEY,
                "name" VARCHAR UNIQUE NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Course" (
                "courseId" SERIAL PRIMARY KEY,
                "courseTitle" VARCHAR NOT NULL,
                "description" VARCHAR NOT NULL,
                "startDate" DATE NOT NULL,
                "duration" VARCHAR NOT NULL,
                "instructor" VARCHAR NOT NULL,
                "price" DECIMAL NOT NULL,
                "newPrice" DECIMAL,
                "status" VARCHAR NOT NULL CHECK ("status" IN ('open', 'close')),
                "meetingLink" VARCHAR NOT NULL,
                "AvgRating" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Product" (
                "productId" SERIAL PRIMARY KEY,
                "name" VARCHAR NOT NULL,
                "description" VARCHAR NOT NULL,
                "howToUse" VARCHAR,
                "quantity" INTEGER NOT NULL,
                "price" DECIMAL NOT NULL,
                "newPrice" DECIMAL,
                "status" VARCHAR NOT NULL CHECK ("status" IN ('out of stock', 'in stock', 'running low')) DEFAULT 'in stock',
                "AvgRating" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "categoryId" INTEGER,
                "brandId" INTEGER
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Resources" (
                "resourceID" SERIAL PRIMARY KEY,
                "entityName" VARCHAR NOT NULL,
                "fileType" VARCHAR NOT NULL,
                "filePath" VARCHAR NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" UUID,
                "productId" INTEGER,
                "courseId" INTEGER,
                "brandId" INTEGER
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Assignment" (
                "assignmentId" SERIAL PRIMARY KEY,
                "title" VARCHAR NOT NULL,
                "subject" VARCHAR NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "courseId" INTEGER
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Reviews" (
                "reviewID" SERIAL PRIMARY KEY,
                "rating" INTEGER,
                "comment" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" UUID
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Cart" (
                "cartId" SERIAL PRIMARY KEY,
                "orderTotalPrice" DECIMAL(10,2) NOT NULL,
                "orderDiscountPrice" DECIMAL(10,2) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" UUID
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Enrollments" (
                "myCourseId" SERIAL PRIMARY KEY,
                "status" VARCHAR NOT NULL CHECK ("status" IN ('accept', 'rejected', 'pending')) DEFAULT 'pending',
                "expireDate" DATE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" UUID,
                "courseId" INTEGER
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Assignmentsubmition" (
                "assignmentSubmitionId" SERIAL PRIMARY KEY,
                "answer" VARCHAR NOT NULL,
                "status" VARCHAR CHECK ("status" IN ('pass', 'fill')),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" UUID,
                "assignmentId" INTEGER
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "CartItem" (
                "id" SERIAL PRIMARY KEY,
                "quantity" INTEGER NOT NULL DEFAULT 1,
                "status" VARCHAR NOT NULL CHECK ("status" IN ('inCart','pending','accept','rejected')) DEFAULT 'inCart',
                "deliveredAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" UUID,
                "cartId" INTEGER,
                "productId" INTEGER
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Notification" (
                "notificationId" SERIAL PRIMARY KEY,
                "messageTitle" VARCHAR NOT NULL,
                "type" VARCHAR NOT NULL,
                "read" BOOLEAN NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "fromId" UUID,
                "toId" UUID
            )
        `);

        // Create junction tables for many-to-many relationships
        await queryRunner.query(`
            CREATE TABLE "CourseReviews" (
                "courseId" INTEGER NOT NULL,
                "reviewID" INTEGER NOT NULL,
                CONSTRAINT "PK_CourseReviews" PRIMARY KEY ("courseId", "reviewID")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "ProductsReviews" (
                "productId" INTEGER NOT NULL,
                "reviewID" INTEGER NOT NULL,
                CONSTRAINT "PK_ProductsReviews" PRIMARY KEY ("productId", "reviewID")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "User"
            ADD CONSTRAINT "FK_User_Role" FOREIGN KEY ("roleId")
            REFERENCES "Role"("roleId") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "Product"
            ADD CONSTRAINT "FK_Product_Category" FOREIGN KEY ("categoryId")
            REFERENCES "Category"("categoryId") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "Product"
            ADD CONSTRAINT "FK_Product_Brand" FOREIGN KEY ("brandId")
            REFERENCES "Brand"("brandId") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "Resources"
            ADD CONSTRAINT "FK_Resources_User" FOREIGN KEY ("userId")
            REFERENCES "User"("UserID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Resources"
            ADD CONSTRAINT "FK_Resources_Product" FOREIGN KEY ("productId")
            REFERENCES "Product"("productId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Resources"
            ADD CONSTRAINT "FK_Resources_Course" FOREIGN KEY ("courseId")
            REFERENCES "Course"("courseId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Resources"
            ADD CONSTRAINT "FK_Resources_Brand" FOREIGN KEY ("brandId")
            REFERENCES "Brand"("brandId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Assignment"
            ADD CONSTRAINT "FK_Assignment_Course" FOREIGN KEY ("courseId")
            REFERENCES "Course"("courseId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Reviews"
            ADD CONSTRAINT "FK_Reviews_User" FOREIGN KEY ("userId")
            REFERENCES "User"("UserID") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "Cart"
            ADD CONSTRAINT "FK_Cart_User" FOREIGN KEY ("userId")
            REFERENCES "User"("UserID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Enrollments"
            ADD CONSTRAINT "FK_Enrollments_User" FOREIGN KEY ("userId")
            REFERENCES "User"("UserID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Enrollments"
            ADD CONSTRAINT "FK_Enrollments_Course" FOREIGN KEY ("courseId")
            REFERENCES "Course"("courseId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Assignmentsubmition"
            ADD CONSTRAINT "FK_Submition_User" FOREIGN KEY ("userId")
            REFERENCES "User"("UserID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Assignmentsubmition"
            ADD CONSTRAINT "FK_Submition_Assignment" FOREIGN KEY ("assignmentId")
            REFERENCES "Assignment"("assignmentId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "CartItem"
            ADD CONSTRAINT "FK_CartItem_User" FOREIGN KEY ("userId")
            REFERENCES "User"("UserID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "CartItem"
            ADD CONSTRAINT "FK_CartItem_Cart" FOREIGN KEY ("cartId")
            REFERENCES "Cart"("cartId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "CartItem"
            ADD CONSTRAINT "FK_CartItem_Product" FOREIGN KEY ("productId")
            REFERENCES "Product"("productId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Notification"
            ADD CONSTRAINT "FK_Notification_FromUser" FOREIGN KEY ("fromId")
            REFERENCES "User"("UserID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Notification"
            ADD CONSTRAINT "FK_Notification_ToUser" FOREIGN KEY ("toId")
            REFERENCES "User"("UserID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "CourseReviews"
            ADD CONSTRAINT "FK_CourseReviews_Course" FOREIGN KEY ("courseId")
            REFERENCES "Course"("courseId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "CourseReviews"
            ADD CONSTRAINT "FK_CourseReviews_Review" FOREIGN KEY ("reviewID")
            REFERENCES "Reviews"("reviewID") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "ProductsReviews"
            ADD CONSTRAINT "FK_ProductsReviews_Product" FOREIGN KEY ("productId")
            REFERENCES "Product"("productId") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "ProductsReviews"
            ADD CONSTRAINT "FK_ProductsReviews_Review" FOREIGN KEY ("reviewID")
            REFERENCES "Reviews"("reviewID") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "FK_User_Role"`);
        await queryRunner.query(`ALTER TABLE "Product" DROP CONSTRAINT "FK_Product_Category"`);
        await queryRunner.query(`ALTER TABLE "Product" DROP CONSTRAINT "FK_Product_Brand"`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_Resources_User"`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_Resources_Product"`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_Resources_Course"`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_Resources_Brand"`);
        await queryRunner.query(`ALTER TABLE "Assignment" DROP CONSTRAINT "FK_Assignment_Course"`);
        await queryRunner.query(`ALTER TABLE "Reviews" DROP CONSTRAINT "FK_Reviews_User"`);
        await queryRunner.query(`ALTER TABLE "Cart" DROP CONSTRAINT "FK_Cart_User"`);
        await queryRunner.query(`ALTER TABLE "Enrollments" DROP CONSTRAINT "FK_Enrollments_User"`);
        await queryRunner.query(`ALTER TABLE "Enrollments" DROP CONSTRAINT "FK_Enrollments_Course"`);
        await queryRunner.query(`ALTER TABLE "Assignmentsubmition" DROP CONSTRAINT "FK_Submition_User"`);
        await queryRunner.query(`ALTER TABLE "Assignmentsubmition" DROP CONSTRAINT "FK_Submition_Assignment"`);
        await queryRunner.query(`ALTER TABLE "CartItem" DROP CONSTRAINT "FK_CartItem_User"`);
        await queryRunner.query(`ALTER TABLE "CartItem" DROP CONSTRAINT "FK_CartItem_Cart"`);
        await queryRunner.query(`ALTER TABLE "CartItem" DROP CONSTRAINT "FK_CartItem_Product"`);
        await queryRunner.query(`ALTER TABLE "Notification" DROP CONSTRAINT "FK_Notification_FromUser"`);
        await queryRunner.query(`ALTER TABLE "Notification" DROP CONSTRAINT "FK_Notification_ToUser"`);
        await queryRunner.query(`ALTER TABLE "CourseReviews" DROP CONSTRAINT "FK_CourseReviews_Course"`);
        await queryRunner.query(`ALTER TABLE "CourseReviews" DROP CONSTRAINT "FK_CourseReviews_Review"`);
        await queryRunner.query(`ALTER TABLE "ProductsReviews" DROP CONSTRAINT "FK_ProductsReviews_Product"`);
        await queryRunner.query(`ALTER TABLE "ProductsReviews" DROP CONSTRAINT "FK_ProductsReviews_Review"`);

        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE "ProductsReviews"`);
        await queryRunner.query(`DROP TABLE "CourseReviews"`);
        await queryRunner.query(`DROP TABLE "Notification"`);
        await queryRunner.query(`DROP TABLE "CartItem"`);
        await queryRunner.query(`DROP TABLE "Assignmentsubmition"`);
        await queryRunner.query(`DROP TABLE "Enrollments"`);
        await queryRunner.query(`DROP TABLE "Cart"`);
        await queryRunner.query(`DROP TABLE "Reviews"`);
        await queryRunner.query(`DROP TABLE "Assignment"`);
        await queryRunner.query(`DROP TABLE "Resources"`);
        await queryRunner.query(`DROP TABLE "Product"`);
        await queryRunner.query(`DROP TABLE "Course"`);
        await queryRunner.query(`DROP TABLE "Brand"`);
        await queryRunner.query(`DROP TABLE "Category"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "Role"`);
    }
}