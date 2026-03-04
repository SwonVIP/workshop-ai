create table _migration_test
(
    id         int identity(1,1) primary key,
    created_at datetime2 default getdate() not null
)
go

insert into _migration_test (created_at) values (getdate())
go
