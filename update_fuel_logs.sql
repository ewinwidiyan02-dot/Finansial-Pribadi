-- Make final_km nullable
alter table fuel_logs alter column final_km drop not null;

-- Update distance calculation to handle nulls (if using generated column)
-- valid only if not using 'stored' generated column dependent on it, 
-- but since it IS stored, we might need to drop and recreate the column or the interaction.
-- However, typically 'generated always' columns require the expression to be valid. 
-- If final_km is null, final_km - initial_km is null, which is valid for a numeric column unless it has 'not null'.
-- So we also need to drop 'not null' from distance if it has it (it usually inherits).

-- Simplest approach for the user:
alter table fuel_logs alter column distance drop not null;
