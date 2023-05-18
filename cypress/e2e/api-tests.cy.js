/*
Візьміть будь-яке публічне API з вказаного списку - https://github.com/public-apis/public-apis

Напишіть серію тестів для цього API. Має бути мінімум 10 автоматизованих тестів, де мають бути покриті наступні аспекти:
- використання різних HTTP методів (GET/POST/etc)
- відправка та перевірка заголовків (headers), як стандартних (User-Agent), так і кастомних
- відправка query параметрів, в тому числі рандомізованих
- перевірка тіла відповіді
- перевірка тривалості виконання запиту
*/

import faker from "faker";

const apiURL = "https://reqres.in";

//створюємо позитивний сценарій
describe("Happy Path", () => {
  //метод GET, відправка: query параметрів, перевірка: статус-коду, тіла відповіді, тривалості виконання запиту
  describe("GET-query", () => {
    const request = {
      url: apiURL.concat("/api/users/"),
      //створюємо  query параметри для відтермінування завантаження
      qs: {
        delay: "3",
      },
      //додаємо обʼєкт для перевірки чи у відповідь прийде один з параметрів
      body: {
        id: 4,
        email: "eve.holt@reqres.in",
        first_name: "Eve",
        last_name: "Holt",
        avatar: "https://reqres.in/img/faces/4-image.jpg",
      },
    };

    //виводимо в консоль тіло відповіді
    it("log", () => {
      cy.request(request).then((response) => {
        cy.log(response.body);
      });
    });

    //перевіряємо, чи статус-код відповіді релевантний до запиту
    it("response code should be 200", () => {
      cy.request(request).then((response) => {
        assert.equal(200, response.status);
      });
    });

    //перевіряємо, чи відбувається затримка у відповіді, що перевищує 3 секунди
    it("response duration should be more than 3s", () => {
      cy.request(request).then((response) => {
        assert.isTrue(response.duration >= 3000);
      });
    });

    //перевіряємо чи на сторінці міститься інформація про очікуваного користувача
    it(`user email should be ${request.body.email}`, () => {
      cy.request(request).then((response) => {
        assert.equal(request.body.email, response.body.data[3].email);
      });
    });
  });

  //метод POST, перевірка: статус-коду, тіла відповіді, тривалості виконання запиту
  describe("POST-query", () => {
    const request = {
      method: "POST",
      url: apiURL.concat("/api/users"),
      body: {
        name: faker.name.findName(),
        job: faker.name.jobTitle(),
      },
    };

    it("log", () => {
      cy.request(request).then((response) => {
        cy.log(`
      status code: ${response.status}\n
      name: ${response.body.name}\n
      job: ${response.body.job}\n
      id: ${response.body.id}\n
      createdAt: ${response.body.createdAt}
      `);
      });
    });

    it("response code should be 201", () => {
      cy.request(request).then((response) => {
        assert.equal(201, response.status);
      });
    });

    it(`name should be ${request.body.name}`, () => {
      cy.request(request).then((response) => {
        assert.equal(request.body.name, response.body.name);
      });
    });

    it(`job should be ${request.body.job}`, () => {
      cy.request(request).then((response) => {
        assert.equal(request.body.job, response.body.job);
      });
    });

    it("response duration should be <= 1s", () => {
      cy.request(request).then((response) => {
        assert.isTrue(response.duration <= 1000);
      });
    });
  });

  //метод PUT, перевірка: статус-кода відповіді, тіла відповіді
  describe("PUT-query", () => {
    const body = {
      name: faker.name.findName(),
      job: faker.name.jobTitle(),
    };

    const request = {
      method: "PUT",
      url: apiURL.concat("/api/users/2"),
      body,
    };

    it("response code should be 200", () => {
      cy.request(request).then((response) => {
        assert.equal(200, response.status);
      });
    });

    it("complex PUT test", () => {
      cy.request(request).then((response) => {
        assert.notStrictEqual(body, response.body);
      });
    });
  });

  //метод PATCH, перевірка: статус-кода відповіді, тіла відповіді
  describe("PATCH-query", () => {
    const body = {
      job: faker.name.jobTitle(),
    };

    const request = {
      method: "PATCH",
      url: apiURL.concat("/api/users/2"),
      body,
    };

    it("response code should be 200", () => {
      cy.request(request).then((response) => {
        assert.equal(200, response.status);
      });
    });

    it(`job should be ${body.job}`, () => {
      cy.request(request).then((response) => {
        assert.equal(body.job, response.body.job);
      });
    });
  });

  //метод DELETE, перевірка: статус-кода відповіді
  describe("DELETE-query", () => {
    const request = {
      method: "DELETE",
      url: apiURL.concat("/api/users/12"),
      failOnStatusCode: false,
    };

    it("response code should be 204", () => {
      cy.request(request).then((response) => {
        assert.equal(204, response.status);
      });
    });
  });
});

describe("Headers tests", () => {
  const userAgent = faker.internet.userAgent();
  const request = {
    method: "GET",
    url: apiURL,
    headers: {
      "user-agent": userAgent,
      customHeader: "customValue",
    },
    failOnStatusCode: false,
  };

  it("test that user-agent header set correctly", () => {
    cy.request(request).then((response) => {
      assert.equal(200, response.status);
      assert.equal(userAgent, response.requestHeaders["user-agent"]);
    });
  });

  it("test that custom header set correctly", () => {
    cy.request(request).then((response) => {
      assert.equal(200, response.status);
      assert.equal("customValue", response.requestHeaders.customHeader);
    });
  });
});

describe("Randomized query parameters", () => {
  it("sends a request with randomized query parameters", () => {
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
    // Генеруємо випадковий query-параметр
    const randomParam = getRandomInt(100);
    const request = {
      url: apiURL,
      qs: {
        param: randomParam,
      },
    };
    // Відправка запиту з рандомізованим query-параметром
    cy.request(request).then((response) => {
      assert.equal(200, response.status);
    });
  });
});
