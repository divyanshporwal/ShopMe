export const successResponse = (data) => {
  return Response.json({ success: true, data });
};

export const errorResponse = (message, status = 400) => {
  return Response.json(
    { success: false, message },
    { status }
  );
};