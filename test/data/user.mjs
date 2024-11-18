Schema.define({
    name: 'user.handle',
    regex: /^[\S]+$/g
});

Schema.define({
    name: 'user.email',
    regex: /^[\S]+$/g
});

Schema.define({
    name: 'user.fullName',
    regex: /^[\S]+$/g
});

Schema.define({
    name: 'user.birthdate',
    regex: /^[\S]+$/g
});

Schema.define({
    name: 'user.location',
    regex: /^[\S]+$/g
});

/*
Schema.define({
    name: 'user.confirmed',
    regex: /^[\S]+$/g
});
//*/

//todo: auto inflate perms from string
/*
Schema.define({
    name: 'user.permissions',
    regex: /^[\S]+$/g
});
//*/
