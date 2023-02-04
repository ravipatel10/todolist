
// If we want to export two function then , we have to use this method otherwise for only one function the method is
// module.exports = getDate;
module.exports.getDate = getDate;

function getDate() {
    let today = new Date();

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    let day = today.toLocaleDateString("en-US", options);

    return day;
}

// We can also write like this
exports.getDay = function() {
    let today = new Date();

    let options = {
        weekday: "long",
    };

    return today.toLocaleDateString("en-US", options);

}
