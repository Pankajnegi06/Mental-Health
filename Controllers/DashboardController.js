const myModel = require("../Models/Schema");

const editProfileDashboard = async (req, res) => {
    const { profileImage, phone, dob, bloodGroup, address, smoking, drinking } = req.body.formData;
    const userId = req.body.userId;

    // console.log("Received profile update data:");
    // console.log(req.body.formData.dob);
    // console.log(userId);

        // profileImage,
        // phone
        // dob,
        // bloodGroup,
        // address,
        // smoking,
        // drinking


    if (!userId) {
        return res.json({
            success: false,
            error: "User id not provided"
        });
    }

    const targetedUser = await myModel.findById(userId);

    if (!targetedUser) {
        return res.json({
            success: false,
            error: "User not found"
        });
    }

    if (profileImage) {
        targetedUser.profileImage = profileImage;
    }
    if (phone) {
        targetedUser.phone = phone;
    }
    if (dob) {
        targetedUser.dob = dob;
    }
    if (bloodGroup) {
        targetedUser.bloodGroup = bloodGroup;
    }
    if (address) {
        targetedUser.address = address;
    }
    if (smoking !== null && smoking !== undefined) {
        targetedUser.smoking = smoking;
    }
    if (drinking !== null && drinking !== undefined) {
        targetedUser.drinking = drinking;
    }

    await targetedUser.save();
    
    // console.log(targetedUser);
    return res.json({
        success: true,
        myData: targetedUser
    })

}

const getProfileData = async (req, res) => {
    const userId = req.body.userId;

    // console.log("hehehehe");


    if (!userId) {
        return res.json({
            success: false,
            error: "user not found"
        })
    }

    const targetedUser = await myModel.findById(userId);

    // console.log(targetedUser);

    return res.json({
        success: true,
        myData: {
            profileImage: targetedUser.profileImage,
            name: targetedUser.name,
            email: targetedUser.email,
            phone: targetedUser.phone,
            dob: targetedUser.dob,
            bloodGroup: targetedUser.bloodGroup,
            address: targetedUser.address,
            smoking: targetedUser.smoking,
            drinking: targetedUser.drinking
        }
    })
}


module.exports = {
    editProfileDashboard,
    getProfileData
};