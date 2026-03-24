-- Schema: delivery_slot
create table delivery_slot
(
    id         bigint identity(1,1) primary key,
    date       date not null,
    start_time time not null,
    end_time   time not null,
    price      decimal(10,2) not null
)
go

-- Schema: coupon
create table coupon
(
    id               bigint identity(1,1) primary key,
    code             varchar(50) not null,
    type             varchar(20) not null,
    value            decimal(10,2) not null,
    description      varchar(200),
    active           bit not null default 1,
    min_order_amount decimal(10,2),
    constraint uq_coupon_code unique (code)
)
go

-- Schema: customer_order
create table customer_order
(
    id                    bigint identity(1,1) primary key,
    order_number          varchar(20) not null,
    session_id            varchar(36) not null,
    status                varchar(20) not null default 'CONFIRMED',
    first_name            varchar(100) not null,
    last_name             varchar(100) not null,
    email                 varchar(200) not null,
    phone                 varchar(30) not null,
    street                varchar(200) not null,
    apartment             varchar(50),
    city                  varchar(100) not null,
    postal_code           varchar(10) not null,
    delivery_instructions varchar(500),
    delivery_slot_id      bigint not null,
    coupon_code           varchar(50),
    subtotal              decimal(10,2) not null,
    delivery_fee          decimal(10,2) not null,
    discount              decimal(10,2) not null default 0,
    total                 decimal(10,2) not null,
    created_at            datetimeoffset,
    constraint uq_order_number unique (order_number),
    constraint fk_order_delivery_slot foreign key (delivery_slot_id) references delivery_slot(id)
)
go

create index ix_customer_order_session_id on customer_order(session_id)
go

-- Schema: order_item
create table order_item
(
    id           bigint identity(1,1) primary key,
    order_id     bigint not null,
    product_name varchar(200) not null,
    image_url    varchar(500),
    quantity     int not null,
    unit_price   decimal(10,2) not null,
    subtotal     decimal(10,2) not null,
    constraint fk_order_item_order foreign key (order_id) references customer_order(id)
)
go

create index ix_order_item_order_id on order_item(order_id)
go

-- Seed: delivery_slot (3 days x 6 two-hour windows)
-- Day 1 (today)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(GETDATE() AS DATE), '08:00', '10:00', 9.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(GETDATE() AS DATE), '10:00', '12:00', 9.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(GETDATE() AS DATE), '12:00', '14:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(GETDATE() AS DATE), '14:00', '16:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(GETDATE() AS DATE), '16:00', '18:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(GETDATE() AS DATE), '18:00', '20:00', 5.90)
go

-- Day 2 (tomorrow)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 1, GETDATE()) AS DATE), '08:00', '10:00', 9.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 1, GETDATE()) AS DATE), '10:00', '12:00', 9.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 1, GETDATE()) AS DATE), '12:00', '14:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 1, GETDATE()) AS DATE), '14:00', '16:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 1, GETDATE()) AS DATE), '16:00', '18:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 1, GETDATE()) AS DATE), '18:00', '20:00', 5.90)
go

-- Day 3 (day after tomorrow)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 2, GETDATE()) AS DATE), '08:00', '10:00', 9.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 2, GETDATE()) AS DATE), '10:00', '12:00', 9.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 2, GETDATE()) AS DATE), '12:00', '14:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 2, GETDATE()) AS DATE), '14:00', '16:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 2, GETDATE()) AS DATE), '16:00', '18:00', 7.90)
insert into delivery_slot (date, start_time, end_time, price) values (CAST(DATEADD(day, 2, GETDATE()) AS DATE), '18:00', '20:00', 5.90)
go

-- Seed: coupon
insert into coupon (code, type, value, description, active, min_order_amount) values ('WELCOME10', 'PERCENTAGE', 10, '10% off your order', 1, null)
insert into coupon (code, type, value, description, active, min_order_amount) values ('SAVE5', 'FIXED_AMOUNT', 5, 'CHF 5 off', 1, null)
insert into coupon (code, type, value, description, active, min_order_amount) values ('FREE_DELIVERY', 'FREE_DELIVERY', 0, 'Free delivery on orders over CHF 99', 1, 99)
insert into coupon (code, type, value, description, active, min_order_amount) values ('EXPIRED1', 'PERCENTAGE', 15, 'Expired coupon', 0, null)
go
