var timeout = 30 * 24 * 60 * 60 * 1000;
var cookieName = 'NODE_YZW_CURRENT_USER_TICKET3';

var cookieExperi = 'NODE_YZW_EXPERI_TICKET';
var Experitimeout = 3 * 24 * 60 * 60 * 1000;

var cookieVote = 'NODE_YZW_VOTE_TICKET';
var Votetimeout = 20 * 24 * 60 * 60 * 1000;

var getAuth = function (req) {
        if (typeof (req.cookies.NODE_YZW_CURRENT_USER_TICKET3) != 'undefined') {
            return req.cookies.NODE_YZW_CURRENT_USER_TICKET3;
        }
        return null;
};

var getExperiAuth = function (req) {
    if (typeof (req.cookies.NODE_YZW_EXPERI_TICKET) != 'undefined') {
        return req.cookies.NODE_YZW_EXPERI_TICKET;
    }
    return null;
};

var getVoteAuth = function (req) {
    if (typeof (req.cookies.NODE_YZW_VOTE_TICKET) != 'undefined') {
        return req.cookies.NODE_YZW_VOTE_TICKET;
    }
    return null;
};

var user = {
    auth: function (req) {
        return getAuth(req) != null;
    },
    logon: function (res, user) {
        res.cookie(cookieName, user, { expires: new Date(Date.now() + timeout), httpOnly: true });
    },
    logout: function (res) {
        res.cookie(cookieName, null, { expires: new Date(Date.now() + -60 * 60 * 1000), httpOnly: true });
    },
    getId: function (req) {
        if (user.auth(req)) {
            return getAuth(req).id;
        }
        return 0;
    },
    getAccount: function (req) {
        if (user.auth(req)) {
            return getAuth(req).account;
        }
        return '';
    },
    getToken: function (req) {
        if (user.auth(req)) {
            return getAuth(req).token;
        }        
        return '';
    },
    getUser: function (req) {
        return getAuth(req);
    },
    experi: function (res, exper) {
        res.cookie(cookieExperi, exper, { expires: new Date(Date.now() + Experitimeout), httpOnly: true });
    },
    experiout: function (res) {
        res.cookie(cookieExperi, null, { expires: new Date(Date.now() + -60 * 60 * 1000), httpOnly: true });
    },
    getExperi :function (req) {
        if(getExperiAuth(req) != null){
            return getExperiAuth(req).extoken;
        }
        return '';
    },
    setVote: function (res, exper) {
        res.cookie(cookieVote, exper, { expires: new Date(Date.now() + Votetimeout), httpOnly: true });
    },
    voteOut: function (res) {
        res.cookie(cookieVote, null, { expires: new Date(Date.now() + -60 * 60 * 1000), httpOnly: true });
    },
    getVote :function (req) {
        if(getVoteAuth(req) != null){
            return getVoteAuth(req).GuidVote;
        }
        return '';
    }
};

module.exports = user;
