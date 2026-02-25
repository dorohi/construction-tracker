export interface NewsReaction {
  id: string;
  type: "like" | "dislike";
  newsId: string;
  userId: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
  createdAt: string;
  updatedAt: string;
}
