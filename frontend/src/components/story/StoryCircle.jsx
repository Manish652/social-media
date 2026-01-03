export default function StoryCircle({ story, onClick }) {
  const displayName = story.isCurrentUser ? "Your Story" : story.username;

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={() => onClick?.(story)}
    >
      <div
        className={`p-[2px] rounded-full ${story.hasStory
            ? "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500"
            : "bg-gray-300"
          }`}
      >
        <div className="bg-white p-[2px] rounded-full">
          <img
            src={story.avatar}
            alt={story.username}
            className="w-14 h-14 rounded-full object-cover"
          />
        </div>
      </div>
      <p className="text-xs mt-1 text-gray-700 truncate w-16 text-center">
        {displayName}
      </p>
    </div>
  );
}
