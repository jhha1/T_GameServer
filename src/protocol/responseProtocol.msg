const msgpack = require('msgpack-lite');

const User = {
  user_id: String,
  nickname: String,
  is_leave: Integer,
  last_login_dt: Integer,
  created_dt: Integer
};

const ItemEquip = {
  item_id: Integer,
  grade: Integer,
  level: Integer,
  piece_count: Integer,
};

const ItemStackable = {
  item_id: Integer,
  count: Integer,
};

const ItemFloatingPoint = {
  item_id: Integer,
  amount: Float,
};


const AccountLogin = {
    platform_type: Integer,
    platform_id: Integer,
    user_id: String,
    device_type: Integer,
    is_leave: Integer
};

const UserLogin = {
    user: User,
    item_floating_point: Array,
    item_stackable: Array,
    item_equip: Array
};