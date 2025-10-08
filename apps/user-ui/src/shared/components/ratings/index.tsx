import { Star, StarHalf, StarOff } from "lucide-react";

interface RatingProps {
  rating: number;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ rating, size = 20 }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      // full star
      stars.push(
        <Star key={i} size={size} className="text-yellow-400 fill-yellow-400" />
      );
    } else if (rating >= i - 0.5) {
      // half star
      stars.push(
        <StarHalf
          key={i}
          size={size}
          className="text-yellow-400 fill-yellow-400"
        />
      );
    } else {
      // empty star
      stars.push(<StarOff key={i} size={size} className="text-gray-300" />);
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {stars}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

export default Rating;
