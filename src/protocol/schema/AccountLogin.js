class AccountLogin {
    constructor(platform_type, platform_id, user_id, device_type, is_leave) {
        this.platform_type = platform_type;
        this.platform_id = platform_id;
        this.user_id = user_id;
        this.device_type = device_type;
        this.is_leave = is_leave;
    }
}

module.exports = AccountLogin;