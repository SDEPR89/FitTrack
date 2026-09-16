ALTER TABLE "program_exercises" DROP CONSTRAINT "program_exercises_program_id_programs_id_fk";
--> statement-breakpoint
ALTER TABLE "program_exercises" ADD CONSTRAINT "program_exercises_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;