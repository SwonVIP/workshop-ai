create table category
(
    id          bigint identity(1,1) primary key,
    name        varchar(100) not null,
    description varchar(500)
)
go

create table product
(
    id          bigint identity(1,1) primary key,
    name        varchar(200) not null,
    description varchar(1000),
    price       decimal(10,2) not null,
    image_url   varchar(500),
    category_id bigint not null,
    created_at  datetime2 default getdate(),
    constraint fk_product_category foreign key (category_id) references category(id)
)
go
