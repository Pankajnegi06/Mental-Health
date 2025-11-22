const myModel = require("../Models/Schema");

const addAppointment = async (req, res) => {
    const { appointmentId, date, time, hospitalName, userId } = req.body;

    if (!date || !time || !hospitalName) {
        return res.status(400).json({ status: false, message: "All fields are required" });
    }

    try {
        const targetUser = await myModel.findById(userId);

        if (!targetUser) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const newAppointment = {
            appointmentId,
            date,
            time,
            hospitalName,
            status: false
        }

        targetUser.allAppointments.push(newAppointment);
        await targetUser.save();

        return res.status(200).json({ status: true, message: "Appointment added successfully", appointment: newAppointment });

    } catch (e) {
        // console.error("Error adding appointment:", e);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}


const removeAppointment = async (req, res) => {
    const { appointmentId, userId } = req.body;

    // console.log("here");
    // console.log(appointmentId);
    // console.log(userId);


    // if (!appointmentId || !userId) {
    //     return res.json({ status: false, message: "Appointment ID and User ID are required" });
    // }

    try {
        const targetUser = await myModel.findById(userId);
        // console.log(targetUser);

        if (!targetUser) {
            return res.json({ status: false, message: "User not found" });
        }

        const appointmentIndex = targetUser.allAppointments.findIndex(app => app.appointmentId === appointmentId);

        if (appointmentIndex === -1) {
            return res.json({ status: false, message: "Appointment not found" });
        }

        targetUser.allAppointments.splice(appointmentIndex, 1);

        await targetUser.save();
        return res.json({ status: true, message: "Appointment removed successfully" });

    } catch (e) {
        // console.error("Error removing appointment:", e);
        return res.json({ status: false, message: "Internal server error" });
    }
}

const getTable = async (req, res) => {
    const { userId } = req.body;

    // console.log('user id hai : ');
    // console.log(userId);

    if (!userId) {
        return res.json({
            success: false,
            myTable: null
        });
    }

    try {

        const targetUser = await myModel.findById(userId);

        const dataTable = targetUser.allAppointments;
        // console.log(dataTable);

        return res.json({
            success: true,
            myTable: dataTable
        });

    } catch (e) {
        return res.json({
            success: false,
            myTable: null
        })
    }

}

const changeTable = async (req, res) => {
    const userId = req.body.userId;
    const { appointmentIds } = req.body;

    // console.log(userId);
    // console.log(appointmentIds);

    if (!userId || !appointmentIds) {
        return res.json({
            success: false,
            myData: null
        });
    }

    try {

        const targetedUser = await myModel.findById(userId);

        for (let appointmentId in appointmentIds) {
            const effect = appointmentIds[appointmentId];

            const appointment = targetedUser.allAppointments.find(
                (appt) => appt.appointmentId == appointmentId
            );

            if (appointment) {
                appointment.status = effect;
            }
        }

        
        await targetedUser.save();
        // console.log(targetedUser);

        return res.json({
            success: true,
        })
    }
    catch (e) {
        return res.json({
            success: false,
        })
    }
}


const getAllApointments = async (req,res) => {
    const userId = req.body.userId;


    // console.log("acessing.........");
    // console.log(userId);

    try{

        const targetedUser = await myModel.findById(userId);

        // console.log(targetedUser);

        return res.json({
            success : true,
            myData : targetedUser.allAppointments
        })

    }catch(e){
        return res.json({
            success : false,
        })
    }

}

module.exports = {
    addAppointment,
    removeAppointment,
    getTable,
    changeTable,
    getAllApointments
};