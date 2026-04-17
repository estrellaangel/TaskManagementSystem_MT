-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'contributor',
    "canViewAllTasks" BOOLEAN NOT NULL DEFAULT false,
    "canCreateTasks" BOOLEAN NOT NULL DEFAULT false,
    "canEditTasks" BOOLEAN NOT NULL DEFAULT false,
    "canDeleteTasks" BOOLEAN NOT NULL DEFAULT false,
    "canAssignTasks" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("canAssignTasks", "canCreateTasks", "canDeleteTasks", "canEditTasks", "createdAt", "email", "id", "name", "password", "role") SELECT "canAssignTasks", "canCreateTasks", "canDeleteTasks", "canEditTasks", "createdAt", "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
