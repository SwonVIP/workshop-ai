-- Migrate audit timestamp columns from datetime2 to datetimeoffset
-- datetime2 lacks timezone info; datetimeoffset maps naturally to java.time.Instant

alter table product alter column created_at datetimeoffset
go

alter table cart alter column created_at datetimeoffset
go

alter table cart alter column updated_at datetimeoffset
go
