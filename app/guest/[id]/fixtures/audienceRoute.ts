function publicInvitation(title: string, poster: string) {
  return {
    status: 'ok',
    payload: {
      mainPoster: { thumbnailFileId: poster },
      shareUrl: {
        urlTitle: title,
        urlDescription: `${title} 안내`,
        urlImage: [poster],
      },
    },
    warnings: [],
  };
}

export const rootInvitation = publicInvitation('기본 초대장', 'root-poster');
export const familyInvitation = publicInvitation(
  '가족 초대장',
  'family-poster'
);
