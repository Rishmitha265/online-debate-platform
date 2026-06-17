import {Link} from "react-router-dom";
function DebateCard({debate}){

    return(
        <div
        style={{
            boarder:"1px solid black",
            padding:"10px",
            margin:"10px",
        }}>

        <h2>{debate.title}</h2>

        <p>{debate.description}</p>

        <Link to={`/debate/${debate.id}`}>
        
        join debate
        </Link>
        </div>
    );
}

export default DebateCard;