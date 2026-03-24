create table customer
(
    id            bigint identity(1,1) primary key,
    email         varchar(200) not null,
    password_hash varchar(255) not null,
    first_name    varchar(100) not null,
    last_name     varchar(100) not null,
    phone         varchar(30),
    street        varchar(200),
    apartment     varchar(50),
    city          varchar(100),
    postal_code   varchar(10),
    created_at    datetimeoffset,
    constraint uq_customer_email unique (email)
)
go

create index ix_customer_email on customer(email)
go
