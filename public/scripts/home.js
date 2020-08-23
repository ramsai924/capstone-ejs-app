//location
window.addEventListener("load", function () {
    const longifield = document.getElementById("longitudes");
    const latfield = document.getElementById("latitudes")

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position, errors)

        function position(loc) {
            const longitude = loc.coords.longitude;
            const latitude = loc.coords.latitude;

            longifield.value = longitude;
            latfield.value = latitude;
            
            var kms = document.getElementsByClassName("kmss")
            var kmss = Array.from(kms)
            var sellerMap = document.getElementsByClassName("mapvals")
            var arrs = Array.from(sellerMap)
            console.log(kmss)
            for (let i = 0; i < arrs.length;i++){
               
                const co_vals = arrs[i].value;
                const arr = co_vals.split(',');
                var lat1 = latitude;
                var lon1 = longitude;
                var lat2 = Number(arr[0]);
                var lon2 = Number(arr[1]);
                // console.log(lat2)
                // console.log(lat1, lon1, lat2, lon2)

                function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
                    var R = 6371; // Radius of the earth in km
                    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
                    var dLon = deg2rad(lon2 - lon1);
                    var a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                        ;
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c; // Distance in km
                    rams = d;
                    kmss[i].innerText = `${Math.round(d)} Km's Away from you`;
                   
                }
                getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2)
                function deg2rad(deg) {
                    return deg * (Math.PI / 180)
                }
            }
           
        }

        function errors(err) {
            document.getElementById("locationPopup").style.display = "block"
            console.log(err)
        }
    } else {
        alert("Your browser does't support geo Location")
    }
});

function off() {
    document.getElementById("locationPopup").style.display = "none";
}

var time = document.getElementById("postTime")
var date = document.getElementById("postDate")

var data = new Date().toLocaleString()
var set = data.split(',')

date.value = set[0]
time.value = set[1]

