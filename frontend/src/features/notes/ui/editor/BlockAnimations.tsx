import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlockAnimationsProps {
  children: React.ReactNode;
  blockId: string;
  isVisible: boolean;
}

const BlockAnimations: React.FC<BlockAnimationsProps> = ({
  children,
  blockId,
  isVisible
}) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={blockId}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.1 }
          }}
          whileTap={{ 
            scale: 0.98,
            transition: { duration: 0.1 }
          }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          className="block-animation-wrapper"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlockAnimations;
