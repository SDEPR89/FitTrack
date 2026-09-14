ALTER TABLE "workout_sets" ALTER COLUMN "reps" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD COLUMN "is_checked" boolean DEFAULT false;