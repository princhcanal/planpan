-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_internal_guap_id_fkey" FOREIGN KEY ("internal_guap_id") REFERENCES "guaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
