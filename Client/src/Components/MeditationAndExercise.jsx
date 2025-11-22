import { motion} from 'framer-motion';
import BreathingExercise from './BreathingExercise';
import { MeditationPlayer } from './MeditationPlayer';

const MeditationAndExercise = () => {

  return (
    <section className={`py-12 px-4 transition-colors duration-300 bg-[#F2F3F5]`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <h2 className={`text-4xl font-bold text-[#1E2939] `}>
              Mindfulness & Wellness
            </h2>
          </div>
          <p className={`text-xl max-w-2xl mx-auto text-[#1E2939]`}>
            Discover tranquility through guided meditation and mindful breathing exercises. 
            Take a moment to center yourself and embrace serenity.
          </p>
        </motion.div>

        <div className="md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MeditationPlayer/>
          <BreathingExercise/>
        </div>
      </div>
    </section>
  );
};

export default MeditationAndExercise;