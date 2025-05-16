const Activity = require('../models/Appointment')

exports.createActivity = async (req, res, next) => {

  const newActivity = await Activity.create(req.body);
  try {
    res.status(201).json({
      success: true,
      data: newActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to create camp",
    });

  }
}

exports.updateActivity = async (req,res,next) =>{

  let activity = Activity.findById(req.params.id);

  if(!activity){
    return res.status(404).json({
      success: false,
      message: `No activity with the id of ${req.params.id}`
    })
  }

  // if(req.user.role!='admin' && activity.lawyerId!=req.user.id){
  //   return res.status(403).json({
  //     success: false,
  //     message: `User ${req.user.id} is not authorized to update this activity`
  //   })
  // }

  activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators:true
  });

  return res.status(201).json({
    success:true,
    data:activity
  })

}

exports.deleteActivity = async(req,res,next) =>{
  const activity = await Activity.findById(req.params.id);

  if(!activity){
    return res.status(404).json({
      message:"No activity found"
    })
  }

  await Activity.deleteOne({ _id: req.params.id });

  return res.status(200).json({
    success:true,
    message: {}
  })

}
