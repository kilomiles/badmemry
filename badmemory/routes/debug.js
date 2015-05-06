var express = require('express');
var router = express.Router();

// TODOXXX this should be a reserved entry in the users table?
admin_user = {'name': 'admin'};

function render(path) {
    return function(req, res) {
        res.render(path, {'user': admin_user});
    };
}

router.get('/', render('admin/index'));
router.get('/users', render('admin/users'));

module.exports = router;
