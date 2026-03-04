create table cart
(
    id          bigint identity(1,1) primary key,
    session_id  varchar(36) not null,
    created_at  datetime2 default getdate(),
    updated_at  datetime2 default getdate(),
    constraint uq_cart_session_id unique (session_id)
)
go

create table cart_item
(
    id          bigint identity(1,1) primary key,
    cart_id     bigint not null,
    product_id  bigint not null,
    quantity    int not null default 1,
    constraint fk_cart_item_cart foreign key (cart_id) references cart(id),
    constraint fk_cart_item_product foreign key (product_id) references product(id)
)
go
