import TrainModel from './schemas/trains.js';

export async function getTrainById(id) {
  return TrainModel.findOne({ id }).lean();
}

export async function getAllTrains() {
  return TrainModel.find({}).lean();
}
