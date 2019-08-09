import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { AppState } from "../../../configureStore";
import { selectProjects } from "./selectors";
import { UPDATE_RESTAURANTS } from "./types";

export function updateGithubUpdated(): ThunkAction<
    void,
    AppState,
    null,
    Action<string>
> {
    return async (dispatch, getState) => {
        const oldProjects = selectProjects(getState());
        const newProjects = await Promise.all(
            oldProjects.map(async (p: ProjectFromAPI) => {
                if (p.githubURL) {
                    const response = await fetch(
                        "https://api.github.com/repos/" +
                            p.githubURL.substr(19, p.githubURL.length - 1) +
                            "/commits",
                    );
                    const json = await response.json();
                    if (json && json[0] && json[0].commit) {
                        return {
                            ...p,
                            lastUpdated: new Date(json[0].commit.author.date),
                        };
                    }
                }
                return p;
            }),
        );
        dispatch(updateProjects(newProjects));
    };
}

function updateProjects(projects: ProjectFromAPI[]) {
    return {
        type: UPDATE_RESTAURANTS,
        projects,
    };
}