.. only:: srs

    Introduction
    ------------

    Purpose
    ^^^^^^^
    SAGE XR (Extended Reality, an umbrella term for Virtual Reality, Augmented Reality, and Mixed Reality) is meant to be a virtual learning or teaching assistant for students and instructors. The assistant can be interacted via Virtual Reality, such as using an Oculus Rift, or a web page, like how communication is facilitated with Large Language Models.
    Users can communicate with the Assistant through voice or through text. The user, either students or instructors, will be able to have a personalized experience with their SAGE XR assistant. Each user will go through an onboarding process upon creating an account, supplying the assistant with personal information.
    The user will then be able to supply the assistant with relevant information, such as textbooks from a course, images from a slideshow, graphs, etc. The assistant will be able to answer future questions based on this supplied information.

    At its core, SAGE consists of two primary components: an instructor tool and a student tool. The instructor tool empowers educators to create and manage course content, facilitate the grading processes, and gain insights into student performance.
    It offers personalized recommendations and guidance to optimize teaching strategies and cater to individual student needs.   

    The student tool, on the other hand, focuses on delivering personalized, culturally responsive learning experiences, adapting to each student's preferences, performance, cultural heritage, language, and learning style. Through a badging and achievement system, SAGE tracks student progress, behavior, and study habits, providing targeted feedback and recommendations.

    Scope
    ^^^^^
    Currently, all information supplied to the assistant is stored in a txt file relevant to the user. Each time the assistant queries a Large Language Model via their API, it sends the entire txt file. Over time, this txt file will get huge, and the user may experience slowdowns, and input token usage for the Assistant will become massive and expensive.
    The challenge is to reduce the current latency when utilizing inputs to get referenced materials. Along with that there is the challenge of Long-Term memory sizing and Input Token Usage. The theory of using a keyword dictionary and no SQL database to organize and store the data and maintain a shortened capability so as not to overburden the storage systems. 

    SAGE's web interface serves as the primary point of interaction for both instructors and students. This interface dynamically adapts to the user's role, presenting personalized dashboards, features, and functionalities. Instructors can easily create and organize course materials, set up assignments and quizzes, and monitor student progress.
    Students can engage with course content, complete assignments, participate in collaborative activities, and track their own progress. 

    SAGE prioritizes student privacy and autonomy, giving students control over their personal data. The system is designed to protect sensitive information and provide students with resources and support when needed. SAGE also aggregates anonymized data to identify broader patterns and trends, informing campus prevention and response efforts without compromising individual student privacy.

    Glossary
    ^^^^^^^^

    .. include:: acronyms.rst

    **Common Terms:**

    - Large Language Model:
        A large language model (LLM) is a computational model capable of language generation or other natural language processing tasks.
        As language models, LLMs acquire these abilities by learning statistical relationships from vast amounts of text during a self-supervised and semi-supervised training process. 



    - Artificial intelligence:
        In its broadest sense, is intelligence exhibited by machines, particularly computer systems.
        It is a field of research in computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals. 

    

    - Extended Reality: 
        Is an umbrella term to refer to augmented reality (AR), virtual reality (VR), and mixed reality (MR).
        The technology is intended to combine or mirror the physical world with a "digital twin world" able to interact with it,[1][2] giving users an immersive experience by being in a virtual or augmented environment. 

    

    - Structured Query Language:
        (pronounced S-Q-L; historically "sequel") is a domain-specific language used to manage data, especially in a relational database management system (RDBMS).
        It is particularly useful in handling structured data, i.e., data incorporating relations among entities and variables. 

    

    - Application Programming Interface:
        Is a way for two or more computer programs or components to communicate with each other.
        It is a type of software interface, offering a service to other pieces of software.
        [1] A document or standard that describes how to build or use such a connection or interface is called an API specification.
        A computer system that meets this standard is said to implement or expose an API.
        The term API may refer either to the specification or to the implementation.
        Whereas a system's user interface dictates how its end-users interact with the system in question, its API dictates how to write code that takes advantage of that system's capabilities. 

    

    - Token:
        Tokens can be thought of as pieces of words.
        Before the API processes the request, the input is broken down into tokens.
        These tokens are not cut up exactly where the words start or end - tokens can include trailing spaces and even sub-words.
        Here are some helpful rules of thumb for understanding tokens in terms of lengths: 

            - 1 token ~= 4 chars in English 
            - 1 token ~= ¾ words 
            - 100 tokens ~= 75 words 

            Or:

            - 1-2 sentence ~= 30 tokens 
            - 1 paragraph ~= 100 tokens 
            - 1,500 words ~= 2048 tokens 

    

    .. include:: requirements.rst

End of file