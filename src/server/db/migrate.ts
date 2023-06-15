import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (process.env.DATABASE_URL) {
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  (async () => {
    try {
      console.log(
        "=========================RUNNING MIGRATIONS========================="
      );
      await migrate(drizzle(migrationClient, { logger: true }), {
        migrationsFolder: "drizzle",
      });
      console.log(
        "=======================DONE RUNNING MIGRATIONS======================="
      );
    } catch (e) {
      console.log(
        "=======================!!!MIGRATIONS FAILED!!!======================="
      );
      console.log(e);
    }

    process.exit();
  })();
}
