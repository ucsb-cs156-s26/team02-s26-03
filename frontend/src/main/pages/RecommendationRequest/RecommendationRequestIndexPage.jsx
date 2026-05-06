import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function RecommendationRequestIndexPage() {
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index Page Placeholder</h1>
        <p>Temp content for Index Page</p>
        <a href="/recommendationrequest/create">Create</a> |{" "}
        <a href="/recommendationrequest/edit/1">Edit</a>
      </div>
    </BasicLayout>
  );
}
