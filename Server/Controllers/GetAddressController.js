const getAddressController = async (req,res) => {

    // console.log("jhere");

    const {lat,lng} = req.body;
    
    if(!lat || !lng){
        return res.json({
            success : false,
            message : "Latitude and Longitude are required"
        })
    }
    // console.log("lat and lng are : ");

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    try{
        const response = await fetch(url,{
            headers: {
                "User-Agent" : "NodeJS App",
            }
        })
        .then((response) => response.json())
        .then((data) => {
            if(data.error){
                return res.json({
                    success : false,
                    message : "Error fetching address",
                    error : data.error
                })
            }
            return res.json({
                success  : true,
                message : "Address fetched successfully",
                address : data.display_name
            })
        })
    }catch(err){
        return res.json({
            success : false,
            message : "Error fetching address",
            error : err.message
        })
    }
}

module.exports = getAddressController;